import { Request, Response } from 'express';
import { clerkService } from '../services/clerkService';
import { logger } from '../utils/logger';
import { Webhook } from 'svix';

export class ClerkController {
  async handleWebhook(req: Request, res: Response) {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      const svix_id = req.headers['svix-id'] as string;
      const svix_timestamp = req.headers['svix-timestamp'] as string;
      const svix_signature = req.headers['svix-signature'] as string;

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Missing svix headers' });
      }

      const webhook = new Webhook(webhookSecret);
      const payload = webhook.verify(JSON.stringify(req.body), {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      });

      await clerkService.handleWebhook((payload as { type: string }).type, (payload as { data: unknown }).data);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Clerk webhook error:', error);
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  }
}
