import CourseCard from '../components/CourseCard';
import { courses } from '../data/courses';

export default function Home() {
  return (
    <main className="flex-grow container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((item) => (
          <CourseCard key={item.id} course={item} />
        ))}
      </div>
    </main>
  );
}