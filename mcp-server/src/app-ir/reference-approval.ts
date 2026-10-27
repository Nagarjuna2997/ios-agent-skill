import {z} from 'zod';
import {sha256} from './schema.js';
const hash=z.string().regex(/^[a-f0-9]{64}$/);
export const ReferenceApprovalSchema=z.object({version:z.literal(1),referenceHash:hash,pinsHash:hash,reviewer:z.string().trim().min(1).max(100),reviewedAt:z.string().datetime(),decision:z.literal('approved')}).strict();
/** Trusted local reviewer input, not an authentication scheme or agent-generated approval. */
export function referenceApproved(value:unknown,evidence:{referenceHash:string;pins:unknown}):boolean {
 const parsed=ReferenceApprovalSchema.safeParse(value);
 return parsed.success&&parsed.data.referenceHash===evidence.referenceHash&&parsed.data.pinsHash===sha256(JSON.stringify(evidence.pins));
}
