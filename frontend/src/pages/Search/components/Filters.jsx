import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../../../store/searchStore';

export default function Filters() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilters } = useSearchStore();

  const tabs = [
    { name: 'ALL', path: '/search' },
    { name: 'IMAGES', path: '/search/images' },
    { name: 'VIDEOS', path: '/search/videos' },
    { name: 'NEWS', path: '/search/news' },
    { name: 'MAPS', path: '/search/maps' },
  ];

  const handleTabClick = (tab) => {
    navigate(tab.path);
    if (tab.name === 'ALL') {
      setFilters({});
    }
  };

  return (
    <div className="flex gap-6 mt-4 border-b border-white/10 pb-2 overflow-x-auto">
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={i}
            onClick={() => handleTabClick(tab)}
            className={`cursor-pointer text-sm transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
