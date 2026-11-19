import { FC, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../api";
import OrderHistory from "../components/OrderHistory";
import { FiUser, FiPackage, FiMail, FiPhone, FiMapPin, FiBriefcase } from "react-icons/fi";

interface Address {
  address: string;
  city: string;
  postalCode: string;
  state: string;
}

interface Company {
  address: Address;
  department: string;
  name: string;
  title: string;
}

interface UserInfo {
  id: number;
  image: string;
  username: string;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  bloodGroup: string;
  address: Address;
  company: Company;
  university: string;
}

const Profile: FC = () => {
  const [info, setInfo] = useState<UserInfo>();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("orders");

  useEffect(() => {
    fetch(`${API_ENDPOINTS.USER.replace(":id", "1")}`)
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      });
  }, []);

  return (
    <div className="container mx-auto min-h-[83vh] w-full max-w-5xl p-4 font-karla dark:text-white space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-lora">Your Account</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile and track your orders
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FiPackage className="text-base" />
            <span>Orders & Purchases</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FiUser className="text-base" />
            <span>Profile Details</span>
          </button>
        </div>
      </div>

      {/* Tab: Orders History */}
      {activeTab === "orders" && <OrderHistory />}

      {/* Tab: Profile Details */}
      {activeTab === "profile" && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center space-y-3">
            <img
              src={info?.image}
              alt={info?.username || "profile"}
              className="w-28 h-28 rounded-full border-4 border-blue-100 dark:border-slate-700 p-1 shadow-sm object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {info?.firstName} {info?.lastName}
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                @{info?.username}
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700 w-full">
              <p className="flex items-center justify-center gap-1.5">
                <FiMail className="text-slate-400" />
                <span>{info?.email}</span>
              </p>
              <p className="flex items-center justify-center gap-1.5">
                <FiPhone className="text-slate-400" />
                <span>{info?.phone}</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
              Personal Information
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                <tr>
                  <td className="py-1.5 font-bold text-slate-500">Gender</td>
                  <td className="py-1.5 text-right font-medium capitalize">{info?.gender}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-slate-500">Age</td>
                  <td className="py-1.5 text-right font-medium">{info?.age} years</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-slate-500">Blood Group</td>
                  <td className="py-1.5 text-right font-medium">{info?.bloodGroup}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-slate-500">University</td>
                  <td className="py-1.5 text-right font-medium truncate max-w-[150px]">{info?.university}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                <FiMapPin className="text-blue-600" />
                <span>Default Address</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {info?.address?.address}
                <br />
                {info?.address?.city}, {info?.address?.postalCode},{" "}
                {info?.address?.state}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                <FiBriefcase className="text-blue-600" />
                <span>Company</span>
              </h3>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {info?.company?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {info?.company?.title} — {info?.company?.department}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
