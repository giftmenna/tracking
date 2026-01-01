import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface DimensionPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

interface Dimensions {
  length: string;
  width: string;
  height: string;
}

export function DimensionPicker({ 
  value = '', 
  onChange, 
  placeholder = 'L×W×H cm',
  disabled = false,
  id = 'dimensions'
}: DimensionPickerProps) {
  const [dimensions, setDimensions] = useState<Dimensions>(() => {
    // Parse initial value if provided
    if (value) {
      const parts = value.split('×');
      return {
        length: parts[0] || '',
        width: parts[1] || '',
        height: parts[2] || ''
      };
    }
    return { length: '', width: '', height: '' };
  });

  const handleDimensionChange = (field: keyof Dimensions, fieldValue: string) => {
    // Only allow numbers and decimal points
    const numericValue = fieldValue.replace(/[^0-9.]/g, '');
    
    const newDimensions = {
      ...dimensions,
      [field]: numericValue
    };
    
    setDimensions(newDimensions);
    
    // Format as L×W×H
    const formattedValue = `${newDimensions.length || ''}×${newDimensions.width || ''}×${newDimensions.height || ''}`;
    onChange?.(formattedValue);
  };

  const handleQuickSelect = (preset: Dimensions) => {
    setDimensions(preset);
    const formattedValue = `${preset.length}×${preset.width}×${preset.height}`;
    onChange?.(formattedValue);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-length`} className="text-xs text-muted-foreground">
            Length (cm)
          </Label>
          <Input
            id={`${id}-length`}
            type="text"
            placeholder="0"
            value={dimensions.length}
            onChange={(e) => handleDimensionChange('length', e.target.value)}
            disabled={disabled}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${id}-width`} className="text-xs text-muted-foreground">
            Width (cm)
          </Label>
          <Input
            id={`${id}-width`}
            type="text"
            placeholder="0"
            value={dimensions.width}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            disabled={disabled}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${id}-height`} className="text-xs text-muted-foreground">
            Height (cm)
          </Label>
          <Input
            id={`${id}-height`}
            type="text"
            placeholder="0"
            value={dimensions.height}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            disabled={disabled}
            className="text-center"
          />
        </div>
      </div>

      {/* Quick Select Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Common Sizes</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleQuickSelect({ length: '30', width: '20', height: '15' })}
          >
            <CardContent className="p-2 text-center">
              <div className="text-xs font-medium">Small</div>
              <div className="text-xs text-muted-foreground">30×20×15</div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleQuickSelect({ length: '40', width: '30', height: '20' })}
          >
            <CardContent className="p-2 text-center">
              <div className="text-xs font-medium">Medium</div>
              <div className="text-xs text-muted-foreground">40×30×20</div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleQuickSelect({ length: '50', width: '40', height: '30' })}
          >
            <CardContent className="p-2 text-center">
              <div className="text-xs font-medium">Large</div>
              <div className="text-xs text-muted-foreground">50×40×30</div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleQuickSelect({ length: '60', width: '50', height: '40' })}
          >
            <CardContent className="p-2 text-center">
              <div className="text-xs font-medium">X-Large</div>
              <div className="text-xs text-muted-foreground">60×50×40</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Display Current Value */}
      {(dimensions.length || dimensions.width || dimensions.height) && (
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Current dimensions:</div>
          <div className="text-lg font-mono font-semibold">
            {dimensions.length || '0'}×{dimensions.width || '0'}×{dimensions.height || '0'} cm
          </div>
        </div>
      )}
    </div>
  );
}
