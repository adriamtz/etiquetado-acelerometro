import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:etiqueta_acelerometro/utils/csv_utils.dart';

class TaggedDataProvider extends ChangeNotifier {
  bool _isRecording = false;
  bool get isRecording => _isRecording;

  String _currentTag = "";
  String get currentTag => _currentTag;

  Timer? _timer;
  final List<List<dynamic>> _buffer = [];

  /// Canvia l'etiqueta activa en qualsevol moment
  void setTag(String tagName) {
    _currentTag = tagName;
    notifyListeners();
  }

  /// Inicia la gravació a 10 Hz (100 ms per mostra)
  void startRecording() {
    if (_isRecording) return;

    _isRecording = true;

    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      final now = DateTime.now().millisecondsSinceEpoch;

      _buffer.add([
        now,
        _currentTag,
      ]);
    });

    notifyListeners();
  }

  /// Para la gravació i exporta CSV
  Future<void> stopRecording() async {
    if (!_isRecording) return;

    _isRecording = false;
    _timer?.cancel();

    await exportCsv();

    // netejar memòria després de guardar
    _buffer.clear();

    notifyListeners();
  }

  Future<void> exportCsv() async {
    await CsvUtils.saveCsv(
      headers: ['timestamp_ms', 'tag'],
      rows: _buffer,
      filename: 'etiquetas_${DateTime.now().millisecondsSinceEpoch}.csv',
    );
  }
}
