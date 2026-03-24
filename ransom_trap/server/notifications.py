import logging
import smtplib
from email.message import EmailMessage
from typing import Any, Dict

import requests


class NotificationDispatcher:
    """Dispatches critical alerts to external services like Telegram, Email, and WhatsApp."""

    def __init__(self, config: Dict[str, Any], logger: logging.Logger = None):
        self.config = config.get("notifications", {})
        self.log = logger or logging.getLogger("ransom_trap.server.notifications")

    def _format_message(self, alert: Dict[str, Any]) -> str:
        """Formats the alert dictionary into a readable text message."""
        is_ransomware = alert.get("alert_type") == "ransomware_suspected"
        
        msg = "🚨 *CRITICAL RANSOMWARE ALERT* 🚨\n\n" if is_ransomware else "⚠️ *SECURITY ALERT* ⚠️\n\n"
        
        msg += f"• *Host:* {alert.get('host', 'Unknown')}\n"
        msg += f"• *Target File:* `{alert.get('path', 'Unknown')}`\n"
        
        if is_ransomware:
            msg += f"• *Malicious Process:* `{alert.get('process_name', 'Unknown')}` (PID: {alert.get('pid', 'Unknown')})\n"
            
            if "remote_ips" in alert and alert["remote_ips"]:
                msg += f"• *Suspected C&C IPs:* {', '.join(alert['remote_ips'])}\n"
                
            msg += "\n*Mitigation Actions Taken:*\n"
            msg += f"• Process Terminated: {'✅ Yes' if alert.get('process_killed') else '❌ No'}\n"
            msg += f"• Folder Locked (Read-Only): {'✅ Yes' if alert.get('folder_locked') else '❌ No'}\n"

        return msg

    def dispatch(self, alert: Dict[str, Any]) -> None:
        """Dispatches the formatted alert to all enabled channels concurrently."""
        message = self._format_message(alert)
        self.log.info("Dispatching external notifications for alert from %s", alert.get('host'))

        if self.config.get("telegram", {}).get("enabled"):
            self.send_telegram(message)
            
        if self.config.get("email", {}).get("enabled"):
            self.send_email(message, alert.get("alert_type"))
            
        if self.config.get("whatsapp", {}).get("enabled"):
            self.send_whatsapp(message)

    def send_telegram(self, text: str) -> None:
        """Sends a message via Telegram Bot API."""
        cfg = self.config.get("telegram", {})
        token = cfg.get("bot_token")
        chat_id = cfg.get("chat_id")
        
        if not token or not chat_id:
            self.log.warning("Telegram enabled but missing bot_token or chat_id")
            print(f"[TELEGRAM] SKIPPED: bot_token={'SET' if token else 'MISSING'}, chat_id={'SET' if chat_id else 'MISSING'}")
            return
            
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        print(f"[TELEGRAM] Sending alert to chat_id={chat_id}...")
        try:
            resp = requests.post(url, json=payload, timeout=10)
            if resp.ok:
                print(f"[TELEGRAM] ✅ Message sent successfully to chat_id={chat_id}")
            else:
                print(f"[TELEGRAM] ❌ API failed ({resp.status_code}): {resp.text}")
                self.log.error("Telegram API failed: %s", resp.text)
        except Exception as e:
            print(f"[TELEGRAM] ❌ Connection error: {e}")
            self.log.error("Failed to connect to Telegram API: %s", e)

    def send_email(self, text: str, alert_type: str) -> None:
        """Sends an email alert via SMTP."""
        cfg = self.config.get("email", {})
        # Note: In a real system you would use the actual SMTP credentials.
        # This is a stub showing the intended logic.
        sender = cfg.get("smtp_user")
        recipient = cfg.get("recipient")
        
        if not sender or not recipient:
            self.log.warning("Email enabled but missing config variables")
            return
            
        msg = EmailMessage()
        msg.set_content(text)
        msg['Subject'] = f"Ransom-Trap Alert: {alert_type}"
        msg['From'] = sender
        msg['To'] = recipient

        try:
            # We skip actual SMTP execution here unless real credentials are provided
            # server = smtplib.SMTP(cfg.get("smtp_host"), cfg.get("smtp_port"))
            # server.starttls()
            # server.login(sender, cfg.get("smtp_pass"))
            # server.send_message(msg)
            # server.quit()
            self.log.info("Simulated email sent to %s", recipient)
        except Exception as e:
            self.log.error("Failed to send email: %s", e)

    def send_whatsapp(self, text: str) -> None:
        """Sends a WhatsApp message (stub for Meta Graph API)."""
        cfg = self.config.get("whatsapp", {})
        token = cfg.get("api_token")
        if not token:
            self.log.warning("WhatsApp enabled but missing api_token")
        
        # This requires an actual Meta developer account and verified phone number
        self.log.info("Simulated WhatsApp message sent")
