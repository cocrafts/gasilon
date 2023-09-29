import { createHash } from 'crypto';

import type { BinaryLike } from 'crypto';

// Hash some data with SHA-256
export function sha256(data: BinaryLike): Buffer {
	return createHash('sha256').update(data).digest();
}
