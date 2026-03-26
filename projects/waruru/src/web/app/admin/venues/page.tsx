'use client'

import { useState } from 'react'
import { Plus, ToggleLeft, ToggleRight, Search, X } from 'lucide-react'
import { WruButton } from '@/components/ui/WruButton'
import { mockVenues } from '@/lib/mock-data'
import type { Venue, VenueFormData, VenueCategory, District } from '@/types'

const CATEGORIES: VenueCategory[] = ['카페', '레스토랑', '바', '공원', '문화공간', '스포츠', '기타']
const DISTRICTS: District[] = ['마포', '성동', '강남', '용산', '송파']

const EMPTY_FORM: VenueFormData = {
  name: '',
  category: '카페',
  district: '마포',
  address: '',
  lat: '',
  lng: '',
  openHours: '',
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<VenueFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.district.includes(search) ||
      v.category.includes(search)
  )

  function toggleActive(id: string) {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    )
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    if (!form.name.trim() || !form.address.trim() || !form.openHours.trim()) {
      setFormError('모든 필수 항목을 입력해주세요.')
      return
    }
    if (form.lat === '' || form.lng === '') {
      setFormError('위도와 경도를 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      // Mock: in production, POST /api/admin/venues
      await new Promise((r) => setTimeout(r, 800))
      const newVenue: Venue = {
        id: `VN-${String(venues.length + 1).padStart(3, '0')}`,
        name: form.name,
        category: form.category,
        district: form.district,
        address: form.address,
        lat: Number(form.lat),
        lng: Number(form.lng),
        openHours: form.openHours,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setVenues((prev) => [newVenue, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setFormError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            장소 DB
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            매칭에 사용되는 장소 데이터를 관리합니다
          </p>
        </div>
        <WruButton
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setShowForm(true)
            setFormError(null)
          }}
        >
          장소 추가
        </WruButton>
      </div>

      {/* Add venue form */}
      {showForm && (
        <section
          className="card-base p-6 mb-6"
          aria-labelledby="add-venue-heading"
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              id="add-venue-heading"
              className="text-base font-bold text-gray-900 dark:text-white"
            >
              새 장소 추가
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label="장소 추가 폼 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="장소명" required>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="카페 노티드 연남점"
                  className={inputClass}
                  required
                  aria-required="true"
                />
              </FormField>

              <FormField label="카테고리" required>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className={inputClass}
                  aria-required="true"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="구" required>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleFormChange}
                  className={inputClass}
                  aria-required="true"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="주소" required className="sm:col-span-2">
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="서울 마포구 연남동 228-11"
                  className={inputClass}
                  required
                  aria-required="true"
                />
              </FormField>

              <FormField label="영업시간" required>
                <input
                  name="openHours"
                  type="text"
                  value={form.openHours}
                  onChange={handleFormChange}
                  placeholder="08:00 - 22:00"
                  className={inputClass}
                  required
                  aria-required="true"
                />
              </FormField>

              <FormField label="위도 (lat)" required>
                <input
                  name="lat"
                  type="number"
                  step="0.0001"
                  value={form.lat}
                  onChange={handleFormChange}
                  placeholder="37.5664"
                  className={inputClass}
                  required
                  aria-required="true"
                />
              </FormField>

              <FormField label="경도 (lng)" required>
                <input
                  name="lng"
                  type="number"
                  step="0.0001"
                  value={form.lng}
                  onChange={handleFormChange}
                  placeholder="126.9241"
                  className={inputClass}
                  required
                  aria-required="true"
                />
              </FormField>
            </div>

            <div className="mt-5 flex items-center gap-3 justify-end">
              <WruButton
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                취소
              </WruButton>
              <WruButton type="submit" variant="primary" loading={saving}>
                저장
              </WruButton>
            </div>
          </form>
        </section>
      )}

      {/* Search + table */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="장소명, 구, 카테고리 검색"
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="장소 검색"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="장소 목록">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {['장소명', '카테고리', '구', '영업시간', '상태', '조작'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 dark:text-gray-600"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((venue) => (
                  <tr
                    key={venue.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {venue.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {venue.category}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {venue.district}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {venue.openHours}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          venue.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        ].join(' ')}
                        aria-label={venue.isActive ? '활성화됨' : '비활성화됨'}
                      >
                        {venue.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(venue.id)}
                        className={[
                          'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          venue.isActive
                            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
                        ].join(' ')}
                        aria-label={`${venue.name} ${venue.isActive ? '비활성화' : '활성화'}`}
                        aria-pressed={venue.isActive}
                      >
                        {venue.isActive ? (
                          <ToggleRight className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" aria-hidden="true" />
                        )}
                        {venue.isActive ? '비활성화' : '활성화'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          총 {filtered.length}개 장소 (전체 {venues.length}개)
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus:border-primary-500 transition'

function FormField({
  label,
  required,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-label="필수">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
