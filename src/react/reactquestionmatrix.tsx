﻿import * as React from 'react';
import {ReactSurveyElement, SurveyQuestionElementBase} from "./reactquestionelement";
import {QuestionMatrixModel} from "../question_matrix";
import {MatrixRowModel} from "../question_matrix";
import {ReactQuestionFactory} from "./reactquestionfactory";
import {ItemValue} from "../itemvalue";

export class SurveyQuestionMatrix extends SurveyQuestionElementBase {
    constructor(props: any) {
        super(props);
    }
    protected get question(): QuestionMatrixModel { return this.questionBase as QuestionMatrixModel; }
    render(): JSX.Element {
        if (!this.question) return null;
        var cssClasses = this.question.cssClasses;
        var firstTH = this.question.hasRows ? <td></td> : null;
        var headers = [];
        for (var i = 0; i < this.question.columns.length; i++) {
            var column = this.question.columns[i];
            var key = "column" + i;
            var columText = this.renderLocString(column.locText);
            headers.push(<th key={key} id={key}>{columText}</th>);
        }
        var rows = [];
        var visibleRows = this.question.visibleRows;
        for (var i = 0; i < visibleRows.length; i++) {
            var row = visibleRows[i];
            var key = "row" + i;
            rows.push(<SurveyQuestionMatrixRow key={key} rowNum={i} question={this.question} cssClasses={cssClasses} isDisplayMode={this.isDisplayMode} row={row} isFirst={i == 0} />);
        }
        return (
            <table className={cssClasses.root} role="form">
                <thead>
                    <tr>
                        {firstTH}
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
           </table>
        );
    }
}

export class SurveyQuestionMatrixRow extends ReactSurveyElement {
    private question: QuestionMatrixModel;
    private row: MatrixRowModel;
    private isFirst: boolean;
    private rowNum: number;
    constructor(props: any) {
        super(props);
        this.question = props.question;
        this.row = props.row;
        this.isFirst = props.isFirst;
        this.rowNum = props.rowNum;
        this.handleOnChange = this.handleOnChange.bind(this);
    }
    handleOnChange(event) {
        this.row.value = event.target.value;
        this.setState({ value: this.row.value });
    }
    componentWillReceiveProps(nextProps: any) {
        super.componentWillReceiveProps(nextProps);
        this.question = nextProps.question;
        this.row = nextProps.row;
        this.isFirst = nextProps.isFirst;
    }
    render(): JSX.Element {
        if (!this.row) return null;
        var firstTD = null;
        var rowId = null;
        if(this.question.hasRows) {
            var rowText = this.renderLocString(this.row.locText);
            rowId = "row" + this.rowNum;
            firstTD = <td id={rowId}>{rowText}</td>;
        }
        var tds = [];
        for (var i = 0; i < this.question.columns.length; i++) {
            var column = this.question.columns[i];
            var key = "value" + i;
            var isChecked = this.row.value == column.value;
            var inputId = this.isFirst && i == 0 ? this.question.inputId : null;
            var aria_labelledby = "column" + i + " " + rowId;
            var td =
                <td key={key}>
                    <label className={this.cssClasses.label}>
                        <input id={inputId} type="radio" className={this.cssClasses.itemValue} name={this.row.fullName}
                               value={column.value} disabled={this.isDisplayMode} checked={isChecked}
                               onChange={this.handleOnChange}
                               aria-labelledby={aria_labelledby}/>
                        <span className="circle"></span>
                        <span className="check"></span>
                    </label>
                </td>;
            tds.push(td);
        }
        return (<tr>{firstTD}{tds}</tr>);
    }
}

ReactQuestionFactory.Instance.registerQuestion("matrix", (props) => {
    return React.createElement(SurveyQuestionMatrix, props);
});
