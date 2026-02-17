import { MustVisitPlace } from '../../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import { buildPlaceMapUrl } from '../../utils/maps';
import SectionHeading from '../../components/SectionHeading';

interface MapsNavigationSectionProps {
  mustVisitPlaces: MustVisitPlace[];
  destination: string;
}

export default function MapsNavigationSection({ mustVisitPlaces, destination }: MapsNavigationSectionProps) {
  if (mustVisitPlaces.length === 0) {
    return null;
  }

  const handleOpenInMaps = (placeName: string) => {
    const url = buildPlaceMapUrl(placeName, destination);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <SectionHeading emoji="🗺️" title="Maps & Navigation">
        <p className="text-sm">Find directions to must-visit places</p>
      </SectionHeading>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {mustVisitPlaces.map((place, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{place.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{destination}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInMaps(place.name)}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
