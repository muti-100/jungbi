import 'dart:async';
import 'dart:math';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ---------------------------------------------------------------------------
// BLE Service — flutter_blue_plus wrapper for Waruru arrival confirmation.
//
// Flow:
//  1. Start scan, filter by match-specific beacon UUID.
//  2. If RSSI >= -75 dBm → confirmed arrival via Supabase Realtime.
//  3. GPS fallback: if BLE unavailable, check distance <= 100m via location.
//  4. Emits [ArrivalEvent] stream that the presentation layer listens to.
// ---------------------------------------------------------------------------

enum ArrivalMethod { ble, gps, manual }

class ArrivalEvent {
  const ArrivalEvent({
    required this.matchId,
    required this.userId,
    required this.method,
    required this.timestamp,
  });

  final String matchId;
  final String userId;
  final ArrivalMethod method;
  final DateTime timestamp;

  Map<String, dynamic> toJson() => {
        'match_id': matchId,
        'user_id': userId,
        'method': method.name,
        'arrived_at': timestamp.toIso8601String(),
      };
}

class BleService {
  BleService({
    required String matchId,
    required String beaconUuid,
    required double venueLat,
    required double venueLng,
  })  : _matchId = matchId,
        _beaconUuid = beaconUuid.toLowerCase(),
        _venueLat = venueLat,
        _venueLng = venueLng;

  static const int _rssiThreshold = -75; // dBm
  static const double _gpsThresholdMeters = 100.0;

  final String _matchId;
  final String _beaconUuid;
  final double _venueLat;
  final double _venueLng;

  final StreamController<ArrivalEvent> _eventController =
      StreamController<ArrivalEvent>.broadcast();

  StreamSubscription<List<ScanResult>>? _scanSubscription;
  RealtimeChannel? _channel;
  bool _arrived = false;

  Stream<ArrivalEvent> get events => _eventController.stream;

  // -------------------------------------------------------------------------
  // Start BLE scanning
  // -------------------------------------------------------------------------
  Future<void> startScanning() async {
    final isSupported = await FlutterBluePlus.isSupported;
    if (!isSupported) {
      // BLE not available on this device — caller should enable GPS fallback.
      return;
    }

    // Ensure Bluetooth is on
    final adapterState = await FlutterBluePlus.adapterState.first;
    if (adapterState != BluetoothAdapterState.on) {
      // Cannot scan — surface this to UI via null event or separate stream.
      return;
    }

    await FlutterBluePlus.startScan(
      timeout: const Duration(minutes: 10),
      androidUsesFineLocation: true,
    );

    _scanSubscription = FlutterBluePlus.scanResults.listen(
      _onScanResults,
      onError: (Object e) {
        // Log and swallow — GPS fallback remains active.
      },
      cancelOnError: false,
    );
  }

  // -------------------------------------------------------------------------
  // Process scan results
  // -------------------------------------------------------------------------
  void _onScanResults(List<ScanResult> results) {
    if (_arrived) return;

    for (final result in results) {
      if (!_matchesBeacon(result)) continue;
      if (result.rssi >= _rssiThreshold) {
        _confirmArrival(method: ArrivalMethod.ble);
        break;
      }
    }
  }

  bool _matchesBeacon(ScanResult result) {
    // Match by advertised service UUID
    final serviceUuids = result.advertisementData.serviceUuids
        .map((u) => u.toString().toLowerCase())
        .toList();

    if (serviceUuids.contains(_beaconUuid)) return true;

    // Also check the device name convention "wru-{matchId[:8]}"
    final name = result.advertisementData.advName.toLowerCase();
    if (name.startsWith('wru-') &&
        _matchId.toLowerCase().startsWith(name.substring(4))) {
      return true;
    }

    return false;
  }

  // -------------------------------------------------------------------------
  // GPS fallback — called from presentation layer after getting location fix
  // -------------------------------------------------------------------------
  void checkGpsArrival({
    required double userLat,
    required double userLng,
  }) {
    if (_arrived) return;
    final dist = _haversineMeters(userLat, userLng, _venueLat, _venueLng);
    if (dist <= _gpsThresholdMeters) {
      _confirmArrival(method: ArrivalMethod.gps);
    }
  }

  // -------------------------------------------------------------------------
  // Manual fallback — user tapped "도착했어요" button
  // -------------------------------------------------------------------------
  void confirmManually() {
    if (_arrived) return;
    _confirmArrival(method: ArrivalMethod.manual);
  }

  // -------------------------------------------------------------------------
  // Emit arrival and broadcast to Supabase Realtime
  // -------------------------------------------------------------------------
  void _confirmArrival({required ArrivalMethod method}) {
    if (_arrived) return;
    _arrived = true;

    final userId = Supabase.instance.client.auth.currentUser?.id ?? '';
    final event = ArrivalEvent(
      matchId: _matchId,
      userId: userId,
      method: method,
      timestamp: DateTime.now(),
    );

    _eventController.add(event);
    _broadcastArrival(event);
    stopScanning();
  }

  Future<void> _broadcastArrival(ArrivalEvent event) async {
    // Persist to DB
    await Supabase.instance.client
        .from('arrivals')
        .upsert(event.toJson())
        .catchError((_) {});

    // Broadcast via Realtime so the match partner's app gets notified instantly.
    _channel = Supabase.instance.client
        .channel('arrival-${event.matchId}')
        .onBroadcast(event: 'partner_arrived', callback: (_) {})
        .subscribe();

    await _channel?.sendBroadcastMessage(
      event: 'user_arrived',
      payload: event.toJson(),
    );
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------
  Future<void> stopScanning() async {
    await _scanSubscription?.cancel();
    _scanSubscription = null;
    if (FlutterBluePlus.isScanningNow) {
      await FlutterBluePlus.stopScan();
    }
  }

  Future<void> dispose() async {
    await stopScanning();
    await _channel?.unsubscribe();
    await _eventController.close();
  }

  // -------------------------------------------------------------------------
  // Haversine distance formula
  // -------------------------------------------------------------------------
  static double _haversineMeters(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const r = 6371000.0; // Earth radius in meters
    final dLat = _toRad(lat2 - lat1);
    final dLon = _toRad(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRad(lat1)) * cos(_toRad(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    return r * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  static double _toRad(double deg) => deg * (pi / 180);
}
