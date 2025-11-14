import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:etiqueta_acelerometro/providers/tagged_data_provider.dart';

class StartStopRecordingButton extends StatelessWidget {
  const StartStopRecordingButton({super.key});

  @override
  Widget build(BuildContext context) {
    final taggedProvider = Provider.of<TaggedDataProvider>(context);

    return ElevatedButton(
      onPressed: () {
        if (taggedProvider.isRecording) {
          taggedProvider.stopRecording();
        } else {
          taggedProvider.startRecording();
        }
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: taggedProvider.isRecording
            ? Colors.red
            : Colors.green,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Text(
        taggedProvider.isRecording ? "Detener" : "Grabar",
        style: const TextStyle(fontSize: 18, color: Colors.white),
      ),
    );
  }
}
