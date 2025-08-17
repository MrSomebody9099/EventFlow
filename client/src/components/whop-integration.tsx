import { useState, useEffect } from "react";
import { whopClient, type WhopUser } from "@/lib/whop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhopIntegrationProps {
  userId?: string;
}

export default function WhopIntegration({ userId }: WhopIntegrationProps) {
  const [whopUser, setWhopUser] = useState<WhopUser | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    verifyWhopAccess();
  }, []);

  const verifyWhopAccess = async () => {
    setIsLoading(true);
    try {
      const hasAccess = await whopClient.verifyAccess();
      setIsVerified(hasAccess);
      
      if (hasAccess) {
        const user = await whopClient.getCurrentUser();
        setWhopUser(user);
        toast({
          title: "Whop Integration Active",
          description: "Connected to Whop platform successfully.",
        });
      } else {
        toast({
          title: "Whop Integration Error",
          description: "Unable to verify Whop access. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Whop verification error:', error);
      setIsVerified(false);
      toast({
        title: "Whop Connection Failed",
        description: "Could not connect to Whop services.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const config = whopClient.getConfig();

  return (
    <Card className="border-2 border-rose-soft/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-script text-xl text-charcoal flex items-center">
            <Shield className="text-rose-dusty mr-2" />
            Whop Integration
          </h3>
          {isVerified !== null && (
            <div className="flex items-center space-x-2">
              {isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-script ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {isVerified ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="font-script text-gray-600">Verifying Whop connection...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-script text-gray-600">App ID</div>
                <div className="font-mono text-xs truncate">{config.appId || 'Not set'}</div>
              </div>
              <div>
                <div className="font-script text-gray-600">Company ID</div>
                <div className="font-mono text-xs truncate">{config.companyId || 'Not set'}</div>
              </div>
            </div>

            {/* User Info */}
            {whopUser && (
              <div className="bg-beige rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {whopUser.profile_pic_url ? (
                    <img 
                      src={whopUser.profile_pic_url} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                  <div>
                    <div className="font-script text-charcoal">
                      {whopUser.username || 'Whop User'}
                    </div>
                    <div className="text-sm text-gray-600">{whopUser.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={verifyWhopAccess}
                variant="outline"
                size="sm"
                className="font-script"
                data-testid="button-retry-whop"
              >
                Retry Connection
              </Button>
              {isVerified && (
                <Button
                  size="sm"
                  className="bg-rose-soft text-white font-script hover:bg-rose-dusty"
                  data-testid="button-whop-dashboard"
                >
                  Open Whop Dashboard
                </Button>
              )}
            </div>

            {/* Integration Features */}
            {isVerified && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="font-script text-sm text-green-800 mb-2">
                  Whop Features Available:
                </div>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• User authentication and access control</li>
                  <li>• Premium event planning features</li>
                  <li>• Advanced vendor management</li>
                  <li>• Enhanced analytics and reporting</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}