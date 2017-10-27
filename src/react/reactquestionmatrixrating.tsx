import * as React from 'react';
import {ReactSurveyElement, SurveyQuestionElementBase} from "./reactquestionelement";
import {QuestionMatrixRatingModel} from "../question_matrixrating";
import {MatrixRatingRowModel} from "../question_matrixrating";
import {ReactQuestionFactory} from "./reactquestionfactory";
import {ItemValue} from "../itemvalue";

export class SurveyQuestionMatrixRating extends SurveyQuestionElementBase {
    constructor(props: any) {
        super(props);
    }
    protected get question(): QuestionMatrixRatingModel { return this.questionBase as QuestionMatrixRatingModel; }
    render(): JSX.Element {
        console.log("in matrixrating");
        if (!this.question) return null;
        var cssClasses = this.question.cssClasses;
        var firstTH = this.question.hasRows ? <td></td> : null;
        var headers = [];
        for (var i = 0; i < this.question.columns.length; i++) {
            var column = this.question.columns[i];
            var key = "column" + i;
            var columText = this.renderLocString(column.locText);
            headers.push(<th key={key}>{columText}</th>);
        }
        var rows = [];
        var visibleRows = this.question.visibleRows;
        for (var i = 0; i < visibleRows.length; i++) {
            var row = visibleRows[i];
            var key = "row" + i;
            rows.push(<SurveyQuestionMatrixRatingRow key={key} question={this.question} cssClasses={cssClasses} isDisplayMode={this.isDisplayMode} row={row} isFirst={i == 0} />);
        }
        return (
            <table className={cssClasses.root}>
                <thead>
                    <tr>
                        {firstTH}
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    <tr><td>OH YEAH</td></tr>
                    {rows}
                </tbody>
           </table>
        );
    }
}

export class SurveyQuestionMatrixRatingRow extends ReactSurveyElement {
    private question: QuestionMatrixRatingModel;
    private row: MatrixRatingRowModel;
    private isFirst: boolean;
    constructor(props: any) {
        super(props);
        this.question = props.question;
        this.row = props.row;
        this.isFirst = props.isFirst;
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
        if(this.question.hasRows) {
            var rowText = this.renderLocString(this.row.locText);
            firstTD = <td>{rowText}</td>;
        }
        var tds = [];
        for (var i = 0; i < this.question.columns.length; i++) {
            var column = this.question.columns[i];
            var key = "value" + i;
            var isChecked = this.row.value == column.value;
            var inputId = this.isFirst && i == 0 ? this.question.inputId : null;
            var td =
                <td key={key}>
                    <label className={this.cssClasses.label}>
                        <input id={inputId} type="radio" className={this.cssClasses.itemValue} name={this.row.fullName}
                               value={column.value} disabled={this.isDisplayMode} checked={isChecked}
                               onChange={this.handleOnChange}
                               aria-label={this.question.locTitle.renderedHtml}/>
                        <span className="circle"></span>
                        <span className="check"></span>
                        <span style={{ 'display': 'none' }}>{this.question.locTitle.renderedHtml}</span>
                    </label>
                </td>;
            tds.push(td);
        }
        return (<tr>{firstTD}{tds}</tr>);
    }
}

ReactQuestionFactory.Instance.registerQuestion("matrixrating", (props) => {
    return React.createElement(SurveyQuestionMatrixRating, props);
});
