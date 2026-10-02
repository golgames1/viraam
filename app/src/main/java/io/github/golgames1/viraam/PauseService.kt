package io.github.golgames1.viraam

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/**
 * Runs only while a quote is on screen. Being a foreground service tells
 * Android that Viraam is actively showing something and playing sound,
 * so it draws at full speed and its audio isn't blocked.
 */
class PauseService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel("pause", "While a quote is showing", NotificationManager.IMPORTANCE_MIN).apply {
                setShowBadge(false); setSound(null, null)
            }
        )
        val n = Notification.Builder(this, "pause")
            .setSmallIcon(android.R.drawable.ic_media_pause)
            .setContentTitle("A short pause")
            .setOngoing(true)
            .build()
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
            else startForeground(1, n)
        } catch (_: Exception) { stopSelf() }
        return START_NOT_STICKY
    }

    companion object {
        fun start(ctx: Context) {
            try { ctx.startForegroundService(Intent(ctx, PauseService::class.java)) } catch (_: Exception) {}
        }
        fun stop(ctx: Context) { ctx.stopService(Intent(ctx, PauseService::class.java)) }
    }
}
