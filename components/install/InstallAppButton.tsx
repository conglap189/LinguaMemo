'use client'

import { useEffect, useState } from 'react'
import { Smartphone } from 'lucide-react'

import { useInstallPrompt } from '@/src/hooks/useInstallPrompt'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type InstallPromptState = ReturnType<typeof useInstallPrompt>

export function InstallAppButton({ install }: { install: InstallPromptState }) {
  const { installed, environment, secureContext, canPrompt, promptInstall, promptFailed, clearPromptFailure } = install
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (promptFailed) setOpen(true)
  }, [promptFailed])

  if (installed) return null

  function handleClick() {
    if (environment === 'browser' && canPrompt) {
      if (!promptInstall()) setOpen(true)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="rounded-2xl border-forest/20 bg-white text-forest hover:bg-lime/30"
      >
        <Smartphone />
        Thêm vào màn hình
      </Button>
      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) clearPromptFailure() }}>
        <DialogContent className="max-h-[min(90dvh,620px)] overflow-y-auto rounded-3xl bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-7 text-2xl font-extrabold text-forest">Dùng LinguaMemo như một ứng dụng</DialogTitle>
            <DialogDescription>
              {environment === 'ios'
                ? 'Mở menu Chia sẻ trong Safari, chọn “Thêm vào màn hình chính”, rồi xác nhận.'
                : environment === 'desktop-safari'
                  ? 'Trong Safari 17 trở lên trên macOS Sonoma trở lên, chọn File > Add to Dock để thêm LinguaMemo.'
                  : environment === 'browser'
                    ? 'Trình duyệt chưa thể mở lời mời cài đặt. Hãy kiểm tra menu của trình duyệt để xem có mục cài đặt ứng dụng hay không.'
                    : 'Trình duyệt này không hỗ trợ cài đặt ứng dụng web. Bạn vẫn có thể lưu LinguaMemo vào dấu trang để mở nhanh hơn.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-2xl bg-cream p-4 text-sm leading-6 text-forest">
            {environment === 'ios' ? (
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>Mở LinguaMemo bằng Safari.</li>
                <li>Nhấn Chia sẻ, sau đó chọn Thêm vào màn hình chính.</li>
                <li>Nhấn Thêm để hoàn tất.</li>
              </ol>
            ) : environment === 'desktop-safari' ? (
              <p>Chọn File &gt; Add to Dock trong Safari. Tính năng này cần Safari 17+ và macOS Sonoma+.</p>
            ) : environment === 'browser' ? (
              <p>Không có lời mời cài đặt tự động. Nếu menu trình duyệt có mục cài đặt ứng dụng, bạn có thể dùng mục đó.</p>
            ) : (
              <p>Không có cách cài đặt ứng dụng được xác nhận cho trình duyệt này.</p>
            )}
            {environment === 'ios' && <p className="border-t border-forest/10 pt-3">Nếu Safari hiển thị tùy chọn <strong>Mở dưới dạng ứng dụng web</strong>, bạn có thể bật tùy chọn đó.</p>}
            {!secureContext && (
              <p className="border-t border-forest/10 pt-3 font-semibold text-forest/80">
                Kết nối hiện tại là HTTP trên mạng nội bộ. Một số trình duyệt chỉ cho cài đặt khi dùng HTTPS.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="w-full rounded-2xl bg-white sm:w-auto" onClick={() => setOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
