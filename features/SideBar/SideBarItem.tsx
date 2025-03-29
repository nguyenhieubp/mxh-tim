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
    rounded-xl transition-all duration-200
    ${isActive 
      ? 'bg-gray-100 font-semibold' 
      : 'hover:bg-gray-50'
    }
    ${onClick ? 'cursor-pointer' : ''}
  `;

  if (href) {
    return (
      <Link href={href} className={className}>
        <span className={`${isActive ? 'scale-110' : ''} transition-transform`}>
          {icon}
        </span>
        <span className="ml-4">{label}</span>
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      <span className={`${isActive ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </span>
      <span className="ml-4">{label}</span>
    </div>
  );
};

export default SideBarItem;