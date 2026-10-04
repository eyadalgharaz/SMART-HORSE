import { redirect } from 'next/navigation';

/**
 * The Health area moved to /medical when the module was built. This route stays
 * as a redirect so links made while it was a placeholder — including any a
 * reviewer bookmarked — still land in the right place.
 */
export default function HealthPage() {
  redirect('/medical');
}
