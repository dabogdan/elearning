import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import PrivateChatRoom, ChatMessage
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            self.other_user = self.scope['url_route']['kwargs']['username']
            self.user = self.scope["user"]

            if not self.user.is_authenticated:
                logging.warning("User is not authenticated, closing WebSocket.")
                await self.close()
                return

            # Generate a unique room name for the chat
            participants_sorted = sorted([self.user.username, self.other_user])
            self.room_group_name = f'chat_{"_".join(participants_sorted)}'

            # Try to get the existing chat room or create a new one
            try:
                self.room = await sync_to_async(PrivateChatRoom.objects.get)(
                    participants__username__in=participants_sorted
                )
                created = False
            except PrivateChatRoom.DoesNotExist:
                self.room = await sync_to_async(PrivateChatRoom.objects.create)()
                created = True

                # Set participants if the room was created
                if created:
                    participants = await sync_to_async(list)(
                        User.objects.filter(username__in=participants_sorted)
                    )
                    await sync_to_async(self.room.participants.set)(participants)

            # Join the chat room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logging.info("WebSocket connection accepted and joined group after setting participants.")

            # Load the last 50 messages from the database
            messages = await sync_to_async(list)(
                ChatMessage.objects.filter(room=self.room).order_by('-timestamp')[:50]
            )
            # Send actual message content
            for message in reversed(messages):  # Reverse to maintain the original order
                logging.info(f"Preparing to send message: {message.message}")
                username = await sync_to_async(lambda: message.user.username)()
                message_text = await sync_to_async(lambda: message.message)()
                timestamp = await sync_to_async(lambda: message.timestamp.strftime('%Y-%m-%d %H:%M:%S'))()

                await self.send(text_data=json.dumps({
                    'username': username,
                    'message': message_text,
                    'timestamp': timestamp,
                }))
                logging.info(f"Sent message: {message_text}")

        except Exception as e:
            logging.error(f"Error in connect method: {str(e)}")
            await self.close()











    # async def connect(self):
    #     try:
    #         self.other_user = self.scope['url_route']['kwargs']['username']
    #         self.user = self.scope["user"]

    #         logging.info(f"is User Authenticated: {self.user.is_authenticated}")

    #         if not self.user.is_authenticated:
    #             logging.warning("User is not authenticated, closing WebSocket.")
    #             await self.close()
    #             return

    #         # Generate a unique room name for the chat
    #         participants_sorted = sorted([self.user.username, self.other_user])
    #         self.room_group_name = f'chat_{"_".join(participants_sorted)}'
    #         logging.info(f"Room Group Name: {self.room_group_name}")

    #         # Try to get the existing chat room
    #         try:
    #             self.room = await sync_to_async(PrivateChatRoom.objects.get)(
    #                 participants__username__in=participants_sorted
    #             )
    #             created = False
    #         except PrivateChatRoom.DoesNotExist:
    #             # If room does not exist, create a new one
    #             self.room = await sync_to_async(PrivateChatRoom.objects.create)()
    #             created = True

    #         # Set participants if the room was created
    #         if created:
    #             participants = await sync_to_async(list)(
    #                 User.objects.filter(username__in=participants_sorted)
    #             )
    #             await sync_to_async(self.room.participants.set)(participants)

    #         # Join the chat room group
    #         await self.channel_layer.group_add(
    #             self.room_group_name,
    #             self.channel_name
    #         )

    #         await self.accept()

    #         # Load the last 50 messages from the database
    #         messages = await sync_to_async(list)(
    #             ChatMessage.objects.filter(room=self.room).order_by('-timestamp')[:50]
    #         )

    #         # Send the messages to the WebSocket
    #         for message in reversed(messages):
    #             await self.send(text_data=json.dumps({
    #                 'username': message.user.username,
    #                 'message': message.message,
    #                 'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
    #             }))

    #     except Exception as e:
    #         logging.error(f"Error in connect method: {str(e)}")
    #         await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            logging.info(f"Disconnect method called for room: {self.room_group_name}")
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        else:
            logging.error("room_group_name not set during disconnect.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        username = self.user.username

        # Save the message to the database
        chat_message = await sync_to_async(ChatMessage.objects.create)(room=self.room, user=self.user, message=message)

        # Send message to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': chat_message.message,
                'username': chat_message.user.username,
                'timestamp': chat_message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        timestamp = event['timestamp']

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'username': username,
            'message': message,
            'timestamp': timestamp,
        }))