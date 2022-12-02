/**
 * Extracted from
 * https://github.com/istanbuljs/istanbuljs/blob/fb8cb4bb99c9e5d36c8b011338d2ab5d3c72ff9c/packages/istanbul-reports/lib/text/index.js
 * and modified by electrovir.
 *
 * The original source code (from the link above) contains the following license at
 * https://github.com/istanbuljs/istanbuljs/blob/fb8cb4bb99c9e5d36c8b011338d2ab5d3c72ff9c/packages/istanbul-reports/LICENSE:
 */

/*
    Copyright 2012-2015 Yahoo! Inc.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
        * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
        * Neither the name of the Yahoo! Inc. nor the
        names of its contributors may be used to endorse or promote products
        derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL YAHOO! INC. BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import {typedHasProperty} from '@augment-vir/common';
import {CoverageSummary, Totals} from 'istanbul-lib-coverage';
import {ContentWriter, Context, ReportBase, ReportNode, Watermarks} from 'istanbul-lib-report';

const NAME_COL = 4;
const PCT_COLS = 7;
const MISSING_COL = 17;
const TAB_SIZE = 1;
const DELIM = ' | ';

function padding(num: number, ch: string = ' ') {
    let str = '';
    let i;
    for (i = 0; i < num; i += 1) {
        str += ch;
    }
    return str;
}

function fill(rawStr: unknown, width: number, right: boolean, tabs: number = 0) {
    let str = String(rawStr);

    const leadingSpaces = tabs * TAB_SIZE;
    const remaining = width - leadingSpaces;
    const leader = padding(leadingSpaces);
    let fmtStr = '';

    if (remaining > 0) {
        const strlen = str.length;
        let fillStr;

        if (remaining >= strlen) {
            fillStr = padding(remaining - strlen);
        } else {
            fillStr = '...';
            const length = remaining - fillStr.length;

            str = str.substring(strlen - length);
            right = true;
        }
        fmtStr = right ? fillStr + str : str + fillStr;
    }

    return leader + fmtStr;
}

function formatName(name: string, maxCols: number, level?: number) {
    return fill(name, maxCols, false, level);
}

function formatPct(pct: Totals | string | number, width: number = PCT_COLS) {
    return fill(pct, width, true, 0);
}

function nodeMissing(node: ReportNode): string {
    if (node.isSummary()) {
        return '';
    }

    const metrics = node.getCoverageSummary(false);
    const isEmpty = metrics.isEmpty();
    const lines = isEmpty ? 0 : metrics.lines.pct;

    let coveredLines: [string, number | boolean][];

    const fileCoverage = node.getFileCoverage();
    if (lines === 100) {
        const branches = fileCoverage.getBranchCoverageByLine();
        coveredLines = Object.entries(branches).map(
            ([
                key,
                {coverage},
            ]) => [
                key,
                coverage === 100,
            ],
        );
    } else {
        coveredLines = Object.entries(fileCoverage.getLineCoverage());
    }

    let newRange = true;
    const ranges = coveredLines
        .reduce(
            (
                accum,
                [
                    line,
                    hit,
                ],
            ) => {
                if (hit) newRange = true;
                else {
                    const lineNumber = parseInt(line);
                    if (newRange) {
                        accum.push([lineNumber]);
                        newRange = false;
                    } else accum[accum.length - 1]![1] = line;
                }

                return accum;
            },
            [] as (number | string)[][],
        )
        .map((range) => {
            const {length} = range;

            if (length === 1) return range[0];

            return `${range[0]}-${range[1]}`;
        });

    return ranges.join(',');
}

function nodeName(node: ReportNode) {
    return node.getRelativeName() || 'All files';
}

function depthFor(node: ReportNode) {
    let ret = 0;
    node = node.getParent() as ReportNode;
    while (node) {
        ret += 1;
        node = node.getParent() as ReportNode;
    }
    return ret;
}

function nullDepthFor() {
    return 0;
}

function findWidth(
    node: ReportNode,
    context: Context,
    nodeExtractor: (node: ReportNode) => string,
    depthFor: (node: ReportNode) => number = nullDepthFor,
) {
    let last = 0;
    function compareWidth(node: ReportNode) {
        last = Math.max(last, TAB_SIZE * depthFor(node) + nodeExtractor(node).length);
    }
    const visitor = {
        onSummary: compareWidth,
        onDetail: compareWidth,
    };
    node.visit(context.getVisitor(visitor), undefined);
    return last;
}

function makeLine(nameWidth: number, missingWidth: number) {
    const name = padding(nameWidth, '-');
    const pct = padding(PCT_COLS, '-');
    const elements = [];

    elements.push(name);
    elements.push(pct);
    elements.push(padding(PCT_COLS + 1, '-'));
    elements.push(pct);
    elements.push(pct);
    elements.push(padding(missingWidth, '-'));
    return elements.join(DELIM.replace(/ /g, '-')) + '-';
}

function tableHeader(maxNameCols: number, missingWidth: number) {
    const elements = [];
    elements.push(formatName('File', maxNameCols, 0));
    elements.push(formatPct('% Stmts'));
    elements.push(formatPct('% Branch', PCT_COLS + 1));
    elements.push(formatPct('% Funcs'));
    elements.push(formatPct('% Lines'));
    elements.push(formatName('Uncovered Line #s', missingWidth));
    return elements.join(DELIM) + ' ';
}

function isFull(metrics: CoverageSummary) {
    return (
        metrics.statements.pct === 100 &&
        metrics.branches.pct === 100 &&
        metrics.functions.pct === 100 &&
        metrics.lines.pct === 100
    );
}

function shouldSkipRow({
    node,
    skipEmpty,
    skipFull,
}: {
    node: ReportNode;
    skipEmpty: boolean;
    skipFull: boolean;
}): boolean {
    const metrics = node.getCoverageSummary(false);
    const isEmpty = metrics.isEmpty();
    if (skipEmpty && isEmpty) {
        return true;
    }
    if (skipFull && isFull(metrics)) {
        return true;
    }

    return false;
}

function tableRow(
    node: ReportNode,
    context: Context,
    colorizer: (input: string, key: keyof Watermarks | string) => string,
    maxNameCols: number,
    level: number,
    skipEmpty: boolean,
    skipFull: boolean,
    missingWidth: number,
) {
    const name = nodeName(node);
    const metrics = node.getCoverageSummary(false);
    const isEmpty = metrics.isEmpty();
    if (shouldSkipRow({node, skipEmpty, skipFull})) {
        return '';
    }

    const mm: Record<keyof Watermarks, number> = {
        statements: isEmpty ? 0 : metrics.statements.pct,
        branches: isEmpty ? 0 : metrics.branches.pct,
        functions: isEmpty ? 0 : metrics.functions.pct,
        lines: isEmpty ? 0 : metrics.lines.pct,
    };
    const colorize = isEmpty
        ? function (str: string) {
              return str;
          }
        : function (str: string, key: keyof Watermarks) {
              return colorizer(str, context.classForPercent(key, mm[key]));
          };
    const elements = [];

    elements.push(colorize(formatName(name, maxNameCols, level), 'statements'));
    elements.push(colorize(formatPct(mm.statements), 'statements'));
    elements.push(colorize(formatPct(mm.branches, PCT_COLS + 1), 'branches'));
    elements.push(colorize(formatPct(mm.functions), 'functions'));
    elements.push(colorize(formatPct(mm.lines), 'lines'));
    elements.push(
        colorizer(formatName(nodeMissing(node), missingWidth), mm.lines === 100 ? 'medium' : 'low'),
    );

    return elements.join(DELIM) + ' ';
}

function getLowestCoverage(
    cFull: Record<
        'lines' | 'statements' | 'functions' | 'branches',
        Record<'total' | 'covered' | 'skipped' | 'pct', number>
    >,
): number {
    return Math.min(cFull.branches.pct, cFull.functions.pct, cFull.statements.pct, cFull.lines.pct);
}

export class SmartTextReport extends ReportBase {
    public readonly file;
    public readonly maxCols;
    public cw: ContentWriter | null;
    public readonly skipEmpty;
    public readonly skipFull;
    public nameWidth: number = 0;
    public missingWidth: number = 0;
    private rootNode: ReportNode | undefined;
    private headerPrinted = false;
    private wereAnyRowsPrinted = false;
    private failBelow = 0;
    private lowestPercent = 100;

    constructor(options: any = {}) {
        super(options);

        this.failBelow = options.failBelow ?? this.failBelow;

        const {maxCols} = options;

        this.file = options.file || null;
        this.maxCols = maxCols != null ? maxCols : process.stdout.columns || 80;
        this.cw = null;
        this.skipEmpty = options.skipEmpty;
        this.skipFull = options.skipFull;
    }

    onStart(root: ReportNode, context: Context) {
        this.rootNode = root;
        this.cw = context.writer.writeFile(this.file);
    }

    private printHeader(context: Context) {
        if (!this.rootNode) {
            throw new Error(`Root node was not set before printing the header.`);
        }
        if (!this.cw) {
            throw new Error("Content writer hasn't been initialized yet.");
        }
        if (this.headerPrinted) {
            return;
        }
        this.headerPrinted = true;
        this.nameWidth = Math.max(NAME_COL, findWidth(this.rootNode, context, nodeName, depthFor));
        this.missingWidth = Math.max(MISSING_COL, findWidth(this.rootNode, context, nodeMissing));

        if (this.maxCols > 0) {
            const pct_cols = DELIM.length + 4 * (PCT_COLS + DELIM.length) + 2;

            const maxRemaining = this.maxCols - (pct_cols + MISSING_COL);
            if (this.nameWidth > maxRemaining) {
                this.nameWidth = maxRemaining;
                this.missingWidth = MISSING_COL;
            } else if (this.nameWidth < maxRemaining) {
                const maxRemaining = this.maxCols - (this.nameWidth + pct_cols);
                if (this.missingWidth > maxRemaining) {
                    this.missingWidth = maxRemaining;
                }
            }
        }
        const line = makeLine(this.nameWidth, this.missingWidth);
        this.cw.println(line);
        this.cw.println(tableHeader(this.nameWidth, this.missingWidth));
        this.cw.println(line);
    }

    onSummary(node: ReportNode, context: Context) {
        if (
            shouldSkipRow({
                node: node,
                skipEmpty: this.skipEmpty,
                skipFull: this.skipFull,
            })
        ) {
            return;
        }
        this.wereAnyRowsPrinted = true;
        this.printHeader(context);
        const nodeDepth = depthFor(node);
        const row = tableRow(
            node,
            context,
            this.cw!.colorize.bind(this.cw),
            this.nameWidth,
            nodeDepth,
            this.skipEmpty,
            this.skipFull,
            this.missingWidth,
        );
        // the c_full property is not documented but it does exist as runtime
        this.lowestPercent = typedHasProperty(node, 'c_full')
            ? Math.min(this.lowestPercent, getLowestCoverage(node.c_full as any))
            : this.lowestPercent;
        if (!row) {
            throw new Error(`Rows should never be empty because they're filtered beforehand.`);
        }

        this.cw?.println(row);
    }

    onDetail(node: ReportNode, context: Context) {
        return this.onSummary(node, context);
    }

    onEnd() {
        if (this.wereAnyRowsPrinted) {
            this.cw?.println(makeLine(this.nameWidth, this.missingWidth));
        }
        this.cw?.close();

        if (this.wereAnyRowsPrinted && this.lowestPercent < this.failBelow) {
            process.exit(1);
        }
    }
}

module.exports = SmartTextReport;
