import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { purchaseId, newStatus } = req.body
  if (!purchaseId || !newStatus) {
    return res.status(400).json({ error: 'purchaseId and newStatus required' })
  }
  // Optionally: Only allow admin users (implement your own admin check here)
  // if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { error } = await supabase.rpc('update_purchase_status', {
    purchase_id: purchaseId,
    new_status: newStatus,
  })
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  return res.status(200).json({ success: true })
}
