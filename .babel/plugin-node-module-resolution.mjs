// from https://gist.github.com/krutoo/70dd3068c9a0b8b1105da749bc475ede
import fs from 'node:fs';
import path from 'node:path';

const EXT = ['js', 'jsx', 'ts', 'tsx'];

// @todo наивная реализация замены импортов node module resolution на конкретные
// вероятно не учитывает какие-то кейсы
export default function nodeModuleResolution() {
  return {
    visitor: {
      ImportOrExportDeclaration: {
        enter(nodePath, { file }) {
          // нет информации о файле - пропускаем
          if (!file.opts.filename) {
            return;
          }

          // у ExportDefaultDeclaration не может быть source - пропускаем
          if (nodePath.node.type === 'ExportDefaultDeclaration') {
            return;
          }

          // если нет source - пропускаем
          if (!nodePath.node.source) {
            return;
          }

          // если это не относительный и не абсолютный путь - пропускаем
          if (
            !nodePath.node.source.value.startsWith('.') &&
            !nodePath.node.source.value.startsWith('/')
          ) {
            return;
          }

          const targetAbsPath = path.resolve(
            path.dirname(file.opts.filename),
            nodePath.node.source.value,
          );

          if (!fs.existsSync(targetAbsPath)) {
            for (const ext of EXT) {
              const result = `${targetAbsPath}.${ext}`;

              if (fs.existsSync(result) && fs.lstatSync(result).isFile()) {
                nodePath.node.source.value = `${nodePath.node.source.value}.js`;
                return;
              }
            }

            return;
          }

          const stats = fs.lstatSync(targetAbsPath);

          // существующий файл без расширения - пропускаем
          if (stats.isFile()) {
            return;
          }

          // не директория - пропускаем
          if (!stats.isDirectory()) {
            return;
          }

          let entrypoint = null;

          for (const ext of EXT) {
            const result = path.resolve(targetAbsPath, `index.${ext}`);

            if (fs.existsSync(result) && fs.lstatSync(result).isFile()) {
              entrypoint = result;
              break;
            }
          }

          if (!entrypoint) {
            return;
          }

          nodePath.node.source.value = `./${path.join(nodePath.node.source.value, 'index.js')}`;
        },
      },
    },
  };
}
