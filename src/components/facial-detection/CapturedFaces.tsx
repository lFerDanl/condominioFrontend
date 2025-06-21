import { CapturedFace } from '@/types/facial-detection';

interface CapturedFacesProps {
  faces: CapturedFace[];
}

export const CapturedFaces = ({ faces }: CapturedFacesProps) => {
  if (faces.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">📸 Rostros Capturados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faces.map((face) => (
          <div key={face.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={face.image} 
                  alt={`Rostro capturado ${face.id}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs text-gray-500">
                  {face.timestamp.toLocaleString()}
                </div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">
                      🎯 {(face.detectionInfo.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  {face.detectionInfo.gender && (
                    <div className="text-sm">
                      <span className="font-semibold text-purple-600">
                        👤 {face.detectionInfo.gender}
                      </span>
                    </div>
                  )}
                  {face.detectionInfo.age && (
                    <div className="text-sm">
                      <span className="font-semibold text-orange-600">
                        📅 {face.detectionInfo.age.low}-{face.detectionInfo.age.high} años
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 