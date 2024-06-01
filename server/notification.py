import asyncio
import logging

subscribers = []

def subscribe(callback):
    subscribers.append(callback)

async def notify_new_accident(accident_data):
    for callback in subscribers:
        await callback(accident_data)
        logging.info("Notified subscriber about new accident")
