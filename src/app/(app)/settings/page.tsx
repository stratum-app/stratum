import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-light text-[#F5F0E8] mb-1"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#4A4640] font-body">Manage your profile and subscription</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Profile</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                <span className="text-sm font-medium text-[#8A8578] font-body">RC</span>
              </div>
              <Button variant="outline" size="sm">Change photo</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full name" defaultValue="Ranvir Chahal" />
              <Input label="Email" defaultValue="ranvirchahal23@gmail.com" type="email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="University" placeholder="Your university" />
              <Input label="Graduation year" placeholder="2026" type="number" />
            </div>
            <Input label="Major / Field" placeholder="Computer Science" />
            <div className="flex justify-end">
              <Button variant="primary" size="sm">Save changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Subscription</h2>
              <Badge variant="muted">Free plan</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[#F5F0E8] font-body font-medium mb-0.5">Free</p>
                <p className="text-xs text-[#4A4640] font-body">Up to 25 contacts · Basic scoring</p>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  $0
                </p>
                <p className="text-xs text-[#4A4640] font-body">forever</p>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-[4px] p-4 border border-[#2A2A2A] mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-[#F5F0E8] font-body">Stratum Pro</p>
                  <p className="text-xs text-[#4A4640] font-body">Unlimited contacts · Full AI playbook · Advanced scoring</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-light text-[#C44820]"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    $12
                  </p>
                  <p className="text-xs text-[#4A4640] font-body">/month</p>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-red-400 font-body">Danger zone</h2>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8A8578] font-body">Delete account</p>
              <p className="text-xs text-[#4A4640] font-body mt-0.5">Permanently delete your account and all data.</p>
            </div>
            <Button variant="danger" size="sm">Delete account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
