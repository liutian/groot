import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/admin/groot/page1">page1</Link>
          </li>
          <li>
            <Link to="/admin/groot/page2">page2</Link>
          </li>
          <li>
            <Link to="/admin/groot/page3">page3</Link>
          </li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </>
  )
}

export default Layout;