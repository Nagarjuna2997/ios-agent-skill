import { appIntentsCode } from '../analyzers/app-intents.js';
export interface PermissionEvidence { key: string; operation: string; line: number; }
/** Concrete operation patterns, not imports. Conditional compilation and wrappers remain review limitations. */
const rules: Array<[string, RegExp]> = [
 ['NSCalendarsFullAccessUsageDescription', /\brequestFullAccessToEvents\s*\(/],
 ['NSCalendarsWriteOnlyAccessUsageDescription', /\brequestWriteOnlyAccessToEvents\s*\(/],
 ['NSRemindersFullAccessUsageDescription', /\brequestFullAccessToReminders\s*\(/],
 ['NSCalendarsUsageDescription', /\brequestAccess\s*\(\s*to:\s*\.event\b/],
 ['NSRemindersUsageDescription', /\brequestAccess\s*\(\s*to:\s*\.reminder\b/],
 ['NSContactsUsageDescription', /\b(?:requestAccess\s*\(\s*for:\s*\.contacts\b)/],
 ['NSPhotoLibraryAddUsageDescription', /\bPHPhotoLibrary\s*\.\s*requestAuthorization\s*\(\s*for:\s*\.addOnly\b/],
 ['NSPhotoLibraryUsageDescription', /\bPHPhotoLibrary\s*\.\s*requestAuthorization\s*\(\s*for:\s*\.readWrite\b|\bPHAsset\s*\.\s*fetchAssets\b/],
 ['NSCameraUsageDescription', /\bAVCaptureDevice\s*\.\s*requestAccess\s*\(\s*for:\s*\.video\b|\bsourceType\s*=\s*\.camera\b/],
 ['NSMicrophoneUsageDescription', /\bAVCaptureDevice\s*\.\s*requestAccess\s*\(\s*for:\s*\.audio\b|\bAVAudioApplication\s*\.\s*requestRecordPermission\s*\(/],
 ['NSLocationWhenInUseUsageDescription', /\b(?:requestWhenInUseAuthorization|requestAlwaysAuthorization|startUpdatingLocation|requestLocation)\s*\(/],
 ['NSLocationAlwaysAndWhenInUseUsageDescription', /\brequestAlwaysAuthorization\s*\(/],
 ['NSBluetoothAlwaysUsageDescription', /\b(?:CBCentralManager|CBPeripheralManager)\s*\(/],
 ['NSSpeechRecognitionUsageDescription', /\bSFSpeechRecognizer\s*\.\s*requestAuthorization\s*\(/],
];
export function permissionEvidence(source: string): PermissionEvidence[] {
 const code=appIntentsCode(source), found: PermissionEvidence[]=[];
 for(const [key,re] of rules){const match=re.exec(code);if(match)found.push({key,operation:match[0],line:code.slice(0,match.index).split('\n').length});}
 // Health read and share scopes are distinct; only literal nonempty sets are conclusive.
 if(/\bimport\s+HealthKit\b/.test(code))for(const [key,re] of [
  ['NSHealthUpdateUsageDescription', /\brequestAuthorization\s*\(\s*toShare:\s*\[\s*\w/],
  ['NSHealthShareUsageDescription', /\brequestAuthorization\s*\([^)]*\bread:\s*\[\s*\w/],
 ] as const){const m=re.exec(code);if(m)found.push({key,operation:m[0],line:code.slice(0,m.index).split('\n').length});}
 return found;
}
