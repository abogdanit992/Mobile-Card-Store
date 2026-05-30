import "./admin-forms.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-panel">{children}</div>;
}
