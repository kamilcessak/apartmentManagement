import { Link } from "react-router-dom";
export const Navigation = () => {
  return (
    <nav>
      <ul className="flex flex-row bg-blue-500">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/tenants">Tenants</Link>
        </li>
      </ul>
    </nav>
  );
};
