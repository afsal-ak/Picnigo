import { Route } from 'react-router-dom';
import Home from '@/features/pages/user/home/Home';
import Packages from '@/features/pages/user/packages/pages/Packages';
import PackageDetails from '@/features/pages/user/packages/pages/PackageDetail';
import BlogsPage from '@/features/pages/user/blog/BlogsPage';
import BlogDetail from '@/features/pages/user/blog/BlogDetails';
import { Fragment } from 'react/jsx-runtime';
const CommonRoutes = (
  <Fragment>
    <Route path="/" element={<Home />} />
    <Route path="/packages" element={<Packages />} />
    <Route path="/packages/:id" element={<PackageDetails />} />
    <Route path="/blog" element={<BlogsPage />} />
    <Route path="/blog/:slug" element={<BlogDetail />} />
  </Fragment>
);

export default CommonRoutes;
