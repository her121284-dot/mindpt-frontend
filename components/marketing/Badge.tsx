interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'gray';
}

export default function Badge({ children, variant = 'orange' }: BadgeProps) {
  const styles = {
    orange: 'bg-[#FFF1E6] text-[#FF6A00] border-[#FF6A00]/20',
    gray: 'bg-gray-100 text-[#666] border-gray-200',
  };

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
}
