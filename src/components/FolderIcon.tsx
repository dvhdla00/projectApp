export default function FolderIcon({ color, size = 56 }: { color: string; size?: number }) {
  const height = size * (44 / 56);
  return (
    <svg
      viewBox="0 0 56 44"
      width={size}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6a4 4 0 0 1 4-4h13l4 4h27a4 4 0 0 1 4 4v3H2V6z"
        fill={color}
        opacity="0.55"
      />
      <path
        d="M2 11a3 3 0 0 1 3-3h46a3 3 0 0 1 3 3v25a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V11z"
        fill={color}
      />
    </svg>
  );
}
