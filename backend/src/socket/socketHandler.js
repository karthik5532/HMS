module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join patient queue updates
    socket.on('join_queue', () => {
      socket.join('queue_room');
      console.log(`Socket ${socket.id} joined queue room`);
    });

    // Handle initial patient queue notification
    socket.on('queue_update', (data) => {
      io.to('queue_room').emit('receive_queue_update', data);
      console.log('Queue updated:', data);
    });

    // Messaging handler
    socket.on('send_message', (data) => {
      io.emit('receive_message', data);
      console.log('Message sent:', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
