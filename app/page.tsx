import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('id')

  if (error) {
    return (
      <main>
        <h1>Error loading courses</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>My Courses</h1>

      <ul>
        {courses?.map((course) => (
          <li key={course.id}>
            {course.name} — {course.status}
          </li>
        ))}
      </ul>
    </main>
  )
}