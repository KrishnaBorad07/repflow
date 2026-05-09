import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Input({ label, type = 'text', value, onChange, placeholder, error, className = '', ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-muted mb-2 tracking-normal">{label}</label>
      )}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-[50px] bg-surface border rounded-xl px-3.5 text-[15px] text-text placeholder:text-dim outline-none transition-colors focus:border-accent/50 ${error ? 'border-bad' : 'border-hairline'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-muted"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-bad text-xs mt-1.5">{error}</p>}
    </div>
  );
}
