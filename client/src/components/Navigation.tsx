import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      label: "儀表板",
      icon: LayoutDashboard,
    },
    {
      path: "/devices",
      label: "設備管理",
      icon: Settings,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                <Leaf className="w-8 h-8" />
                <span className="text-xl font-bold">AI碳盤查系統</span>
              </a>
            </Link>

            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={
                        isActive
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "hover:bg-gray-100"
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
