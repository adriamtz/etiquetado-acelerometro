import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:etiqueta_acelerometro/providers/tagged_data_provider.dart';
import 'package:etiqueta_acelerometro/widgets/start_stop_recording_button.dart';

class TaggedDataPage extends StatelessWidget {
  const TaggedDataPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<TaggedDataProvider>(context);
    final String active = provider.currentTag;

    final estados = [
      'tumbada',
      'de pie',
      'comiendo parada',
      'comiendo en desplazamiento',
      'rumiando',
      'desplazándose',
      'corriendo',
    ];

    final eventos = [
      'se tumba',
      'se levanta',
      'salta',
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Etiquetado acelerómetro')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              'Estados',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: estados.map((e) {
                final bool isActive = (e == active);

                return ElevatedButton(
                  onPressed: () => provider.setTag(e),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isActive ? Colors.blue : Colors.grey[300],
                    foregroundColor: isActive ? Colors.white : Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  ),
                  child: Text(e),
                );
              }).toList(),
            ),

            const SizedBox(height: 20),
            const Text(
              'Eventos',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: eventos.map((e) {
                return ElevatedButton(
                  onPressed: () => provider.setTag(e),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  ),
                  child: Text(e),
                );
              }).toList(),
            ),

            const SizedBox(height: 20),
            const StartStopRecordingButton(),
          ],
        ),
      ),
    );
  }
}
