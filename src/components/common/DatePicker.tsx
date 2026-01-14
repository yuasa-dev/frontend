import { useMemo } from 'react'

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const formattedDate = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1
    const day = selectedDate.getDate()
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]
    return `${year}年${month}月${day}日(${dayOfWeek})`
  }, [selectedDate])

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }, [selectedDate])

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={handlePrevDay}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="前の日"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleToday}
        className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
          isToday
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        {formattedDate}
      </button>

      <button
        onClick={handleNextDay}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="次の日"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
