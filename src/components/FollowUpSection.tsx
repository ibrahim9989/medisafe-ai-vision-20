
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar, RefreshCw } from 'lucide-react';
import { PrescriptionData } from '@/types/prescription';

interface FollowUpSectionProps {
  data: PrescriptionData;
  onChange: (data: PrescriptionData) => void;
}

const FollowUpSection = ({ data, onChange }: FollowUpSectionProps) => {
  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-medium">Follow-up Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={data.isFollowUp}
            onCheckedChange={(checked) => 
              onChange({ ...data, isFollowUp: checked })
            }
          />
          <label className="text-sm font-medium">This is a follow-up prescription</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Follow-up Date
            </label>
            <Input
              type="date"
              value={data.followUpDate}
              onChange={(e) => onChange({ ...data, followUpDate: e.target.value })}
              className="bg-white/60 border-white/30"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpSection;
