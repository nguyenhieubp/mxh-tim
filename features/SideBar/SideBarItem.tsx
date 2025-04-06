import Link from 'next/link';

interface SideBarItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const SideBarItem = ({ href, icon, label, onClick, isActive }: SideBarItemProps) => {
  const className = `
    flex items-center p-3 
    rounded-xl transition-all duration-300
    ${isActive 
      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-semibold shadow-sm' 
      : 'hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 text-gray-600 hover:text-indigo-600'
    }
    ${onClick ? 'cursor-pointer' : ''}
    group
  `;

  if (href) {
    return (
      <Link href={href} className={className}>
        <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
          {icon}
        </span>
        <span className="ml-4">{label}</span>
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
        {icon}
      </span>
      <span className="ml-4">{label}</span>
    </div>
  );
};

export default SideBarItem;