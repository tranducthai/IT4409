import DashboardCard from '../components/DashboardCard';
import { courses } from '../data/courses';

export default function Dashboard() {
  return (
    <main className="flex-grow container mx-auto px-4 md:px-32 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Courses</h1>
      <div className="max-w-5xl">
        {courses.map((item) => (
          <DashboardCard key={item.id} course={item} />
        ))}
      </div>
    </main>
  );
}