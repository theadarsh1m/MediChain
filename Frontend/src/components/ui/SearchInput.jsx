import { Search } from "lucide-react";
import Input from "./Input";

export default function SearchInput({ value, onChange, placeholder = "Search...", className = "", ...props }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 h-4 w-4 text-slate-400 dark:text-slate-500" />
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-11"
        {...props}
      />
    </div>
  );
}
