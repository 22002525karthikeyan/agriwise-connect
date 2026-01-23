import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Phone, MapPin, Building2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
}

interface ProfileSetupCardProps {
  role: 'farmer' | 'landowner' | 'buyer';
  onProfileUpdate?: () => void;
}

export function ProfileSetupCard({ role, onProfileUpdate }: ProfileSetupCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    business_name: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, email, address, business_name')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfileData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        business_name: data.business_name || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        business_name: profileData.business_name,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('common.error') || 'Error',
        description: t('profile.updateError') || 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('profile.updated') || 'Profile Updated!',
        description: t('profile.updatedDesc') || 'Your details have been saved.',
      });
      setProfileDialogOpen(false);
      onProfileUpdate?.();
    }
    setIsSaving(false);
  };

  const isProfileIncomplete = !profileData.phone || !profileData.address;
  const roleLabel = role === 'farmer' ? t('profile.farmName') : role === 'landowner' ? t('profile.businessName') : t('profile.businessName');

  if (!isProfileIncomplete) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 mb-6">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {t('profile.completeProfile') || 'Complete your profile'}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('profile.completeProfileDesc') || 'Add your contact details and address for a better experience'}
              </p>
            </div>
          </div>
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                {t('profile.addDetails') || 'Add Details'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t('profile.myProfile') || 'My Profile'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder={t('auth.fullName') || 'Full Name'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {roleLabel || 'Business/Farm Name'}
                  </Label>
                  <Input
                    id="businessName"
                    value={profileData.business_name}
                    onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                    placeholder={role === 'farmer' ? 'My Farm Name' : 'Business Name'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t('profile.phone') || 'Phone Number'} *
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('profile.address') || 'Address'} *
                  </Label>
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Village, District, State, Pincode"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('profile.emailDisabled') || 'Email cannot be changed'}
                  </p>
                </div>

                <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
                  {isSaving ? t('common.loading') : t('profile.saveProfile') || 'Save Profile'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
