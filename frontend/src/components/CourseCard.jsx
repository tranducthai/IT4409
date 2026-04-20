const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      <div className="relative h-40 bg-gray-100">
        <img src={course.image} className="w-full h-full object-contain p-4" alt={course.title} />
        <div className="absolute top-2 right-2 bg-blue-900/80 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">
          {course.code}
        </div>
      </div>
      <div className="p-4 flex-grow">
        <p className="text-gray-400 text-xs font-bold uppercase">{course.category}</p>
        <p className="text-blue-500 text-[11px] font-semibold">{course.code}</p>
        <h3 className="text-gray-800 font-bold text-sm mt-1 leading-tight line-clamp-2">{course.title}</h3>
      </div>
      {course.startDate && (
        <div className="px-4 pb-4">
          <p className="text-gray-400 text-[10px]">Starts: {course.startDate}</p>
        </div>
      )}
    </div>
  );
};
export default CourseCard;