import { toast } from 'sonner'

export const notify = {
  success: (msg: string) => toast.success(msg, {
    style: { borderLeft: '3px solid var(--color-success)' }
  }),
  error: (msg: string) => toast.error(msg, {
    style: { borderLeft: '3px solid var(--color-error)' }
  }),
  info: (msg: string) => toast(msg, {
    style: { borderLeft: '3px solid var(--color-primary)' }
  }),
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id?: string | number) => toast.dismiss(id),
}
