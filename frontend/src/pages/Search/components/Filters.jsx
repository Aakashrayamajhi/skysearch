import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../../../store/searchStore';

export default function Filters() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilters } = useSearchStore();

  const tabs = [
    { name: 'ALL', type: null },
    { name: 'IMAGES', type: 'image' },
    { name: 'VIDEOS', type: 'video' },
    { name: 'NEWS', type: 'news' },
    { name: 'MAPS', type: 'map' },
  ];

  const urlParams = new URLSearchParams(location.search);
  const currentType = urlParams.get('type') || '';

  const getActiveTab = () => {
    if (!currentType) return 'ALL';
    const tab = tabs.find(t => t.type === currentType);
    return tab ? tab.name : 'ALL';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab) => {
    const newParams = new URLSearchParams(location.search);

    if (tab.type) {
      newParams.set('type', tab.type);
      setFilters({ contentType: tab.type });
    } else {
      newParams.delete('type');
      setFilters({});
    }

    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <div className="flex gap-6 mt-4 border-b border-white/10 pb-2 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <button
            key={tab.name}
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
