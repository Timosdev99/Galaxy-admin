
import Link from 'next/link';

export default function NavItems({ items, isLightMode }: any) {
  return (
    <>
      {items.map((item: any, index: any) => (
        <Link 
          key={index}
          href={item.href}
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md 
            ${item.isActive 
              ? 'bg-blue-50 text-blue-700' 
              : `${isLightMode ? 'text-gray-600' : 'text-gray-300'} hover:bg-gray-700 hover:text-white`
            }`}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.text}
        </Link>
      ))}
    </>
  );
}