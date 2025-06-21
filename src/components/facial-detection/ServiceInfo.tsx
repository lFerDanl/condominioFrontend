import { DetectionService } from '@/services/detection';

interface ServiceInfoProps {
  service: DetectionService | null;
}

export const ServiceInfo = ({ service }: ServiceInfoProps) => {
  if (!service) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h4 className="font-semibold mb-2 text-gray-800">🔧 Configuración del Servicio:</h4>
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Servidor:</strong> {service.getConfig().server}:{service.getConfig().port}</p>
        <p><strong>Límite de rostros:</strong> {service.getConfig().options.limit}</p>
        <p><strong>Plugins:</strong> {service.getConfig().options.face_plugins}</p>
        <p><strong>Umbral de confianza:</strong> {service.getConfig().options.det_prob_threshold}</p>
      </div>
    </div>
  );
}; 