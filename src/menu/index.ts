import { chain, mergeWith } from '@angular-devkit/schematics';
import { dasherize, classify } from '@angular-devkit/core';
import { MenuOptions } from './schema';
import { apply, filter, move, Rule, template, url, branchAndMerge, Tree, SchematicContext } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { addDeclarationToNgModule } from '../utils/ng-modules-utils';
import { findModuleFromOptions } from '@schematics/angular/utility/find-module';

const stringUtils = { dasherize, classify };

function filterTemplates(options: MenuOptions): Rule {
  if (!options.menuService) {
    return filter(path => !path.match(/\.service\.ts$/) && !path.match(/-item\.ts$/) && !path.match(/\.bak$/));
  }
  return filter(path => !path.match(/\.bak$/));
}

export default function (options: MenuOptions): Rule {

    return (host: Tree, context: SchematicContext) => {

      options.path = options.path ? normalize(options.path) : options.path;
      options.module = options.module || findModuleFromOptions(host, options) || '';

      const templateSource = apply(url('./files'), [
        filterTemplates(options),
        template({
          ...stringUtils,
          ...options
        }),
        move(options.sourceDir)
      ]);

      const rule = chain([
        branchAndMerge(chain([
          addDeclarationToNgModule(options, options.export),
          mergeWith(templateSource)
        ])),
      ]);

      return rule(host, context);

    }
}