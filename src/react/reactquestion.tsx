﻿import * as React from 'react';
import {QuestionBase} from '../questionbase';
import {Question} from '../question';
import {SurveyQuestionCommentItem} from './reactquestioncomment';
import {SurveyElementBase, ReactSurveyElement} from './reactquestionelement';
import {SurveyCustomWidget} from './custom-widget';

export interface ISurveyCreator {
    createQuestionElement(question: QuestionBase): JSX.Element;
    renderError(key: string, errorText: string, cssClasses: any): JSX.Element;
    questionTitleLocation(): string;
    questionErrorLocation(): string;
}

export class SurveyQuestion extends React.Component<any, any> {
    private questionBase: QuestionBase;
    protected question: Question;
    private creator: ISurveyCreator;
    constructor(props: any) {
        super(props);
        this.setQuestion(props.question);
        this.state = this.getState();
        this.creator = props.creator;
    }
    componentWillReceiveProps(nextProps: any) {
        this.creator = nextProps.creator;
        this.setQuestion(nextProps.question);
        this.setState(this.getState());
    }
    private setQuestion(question) {
        this.questionBase = question;
        this.question = question instanceof Question ? question : null;
    }
    private getState() {
        var value = this.question ? this.question.value : null;
        return {
            visible: this.questionBase.visible, value: value, error: 0, renderWidth: 0,
            visibleIndexValue: -1, isReadOnly : this.questionBase.isReadOnly
        };
    }
    componentDidMount() {
        if (this.questionBase) {
            var self = this;
            this.questionBase["react"] = self;
            this.questionBase.registerFunctionOnPropertiesValueChanged(["renderWidth", "indent", "rightIndent"],  function () {
                    self.state.renderWidth = self.state.renderWidth + 1;
                    self.setState(self.state);
                    }, "react");
            this.questionBase.registerFunctionOnPropertyValueChanged("visibleIndex", function() {
                    self.state.visibleIndexValue = self.questionBase.visibleIndex;
                    self.setState(self.state);
                }, "react");
            this.questionBase.registerFunctionOnPropertyValueChanged("isReadOnly", function() {
                    self.state.isReadOnly = self.questionBase.isReadOnly;
                    self.setState(self.state);
                }, "react");
            var el = this.refs["root"];
            if (el && this.questionBase.survey) this.questionBase.survey.afterRenderQuestion(this.questionBase, el);
        }
    }
    componentWillUnmount() {
        if (this.questionBase) {
            this.questionBase["react"] = null;
            this.questionBase.unRegisterFunctionOnPropertiesValueChanged(["visibleIndex", "renderWidth", "indent", "rightIndent, isReadOnly"], "react");
        }
    }
    render(): JSX.Element {
        if (!this.questionBase || !this.creator) return null;
        if (!this.questionBase.visible) return null;
        var cssClasses = this.questionBase.cssClasses;
        var questionRender = this.renderQuestion();
        var title = this.questionBase.hasTitle ? this.renderTitle(cssClasses) : null;
        var description = this.renderDescription(cssClasses);
        var titleTop = this.creator.questionTitleLocation() == "top" ? title : null;
        var titleBottom = this.creator.questionTitleLocation() == "bottom" ? title : null;
        var descriptionTop = this.creator.questionTitleLocation() == "top" ? description : null;
        var descriptionBottom = this.creator.questionTitleLocation() == "bottom" ? description : null;
        var comment = (this.question && this.question.hasComment) ? this.renderComment(cssClasses) : null;
        var errors = this.renderErrors(cssClasses);
        var errorsTop = this.creator.questionErrorLocation() == "top" ? errors : null;
        var errorsBottom = this.creator.questionErrorLocation() == "bottom" ? errors : null;
        var paddingLeft = (this.questionBase.indent > 0) ? this.questionBase.indent * cssClasses.indent + "px" : null;
        var paddingRight = (this.questionBase.rightIndent > 0) ? this.questionBase.rightIndent * cssClasses.indent + "px" : null;
        let rootStyle = { };
        if (this.questionBase.renderWidth) rootStyle["width"] = this.questionBase.renderWidth;
        if (paddingLeft) rootStyle["paddingLeft"] = paddingLeft;
        if (paddingRight) rootStyle["paddingRight"] = paddingRight;
        
        if (this.questionBase.getType() == "radiogroup" || this.questionBase.getType() == "rating") {
            var aria_required = this.question.isRequired? "true":"false";
            return (
                <div ref="root" id={this.questionBase.id} className={cssClasses.mainRoot} style={rootStyle}>
                <fieldset role="radiogroup" aria-required={aria_required}>
                    {titleTop}
                    {descriptionTop}
                    {errorsTop}
                    {questionRender}
                    {comment}
                    {errorsBottom}
                    {titleBottom}
                    {descriptionBottom}
                </fieldset>
                </div>
            );
        } else {
            return (
                <div ref="root" id={this.questionBase.id} className={cssClasses.mainRoot} style={rootStyle}>
                    {titleTop}
                    {descriptionTop}
                    {errorsTop}
                    {questionRender}
                    {comment}
                    {errorsBottom}
                    {titleBottom}
                    {descriptionBottom}
                </div>
            );
        }

    }
    protected renderQuestion(): JSX.Element {
        var customWidget = this.questionBase.customWidget;
        if (!customWidget) {
            return this.creator.createQuestionElement(this.questionBase);
        }
        return <SurveyCustomWidget creator={this.creator} question={this.questionBase}></SurveyCustomWidget>
    }
    protected renderTitle(cssClasses: any): JSX.Element {
        var titleText = SurveyElementBase.renderLocString(this.question.locTitle);
        if (this.questionBase.getType() == "matrix") {
            return <h5 className={cssClasses.title}>{titleText}</h5>;
        } else {
            return <legend className={cssClasses.title}>{titleText}</legend>;
        }
    }
    protected renderDescription(cssClasses: any): JSX.Element {
        if(!this.questionBase.hasDescription) return null;
        var descriptionText = SurveyElementBase.renderLocString(this.question.locDescription);
        return <div className={cssClasses.description}>{descriptionText}</div>;
    }
    protected renderComment(cssClasses: any): JSX.Element {
        var commentText = SurveyElementBase.renderLocString(this.question.locCommentText);
        return (<div>
                <div>{commentText}</div>
                <SurveyQuestionCommentItem  question={this.question} cssClasses={cssClasses} />
            </div>);
    }
    protected renderErrors(cssClasses: any): JSX.Element {
        return <SurveyQuestionErrors question={this.question} cssClasses={cssClasses} creator={this.creator} />
    }
}

export class SurveyQuestionErrors extends ReactSurveyElement {
    protected question: Question;
    private creator: ISurveyCreator;
    constructor(props: any) {
        super(props);
        this.setQuestion(props.question);
        this.state = this.getState()
        this.creator = props.creator;
    }
    componentWillReceiveProps(nextProps: any) {
        this.setQuestion(nextProps.question);
        this.setState(this.getState());
        this.creator = nextProps.creator;
    }
    private setQuestion(question) {
        this.question = question instanceof Question ? question : null;
        if (this.question) {
            this.question.errorsChangedCallback = () => {
                this.setState(this.getState(this.state));
            }
        }
    }
    private getState(prevState = null) {
        return !prevState ? { error: 0 } : { error: prevState.error + 1 };
    }
    render(): JSX.Element {
        if (!this.question || this.question.errors.length == 0) return null;
        var errors = [];
        for (var i = 0; i < this.question.errors.length; i++) {
            var errorText = this.question.errors[i].getText();
            var key = "error" + i;
            errors.push(this.creator.renderError(key, errorText, this.cssClasses));
        }
        return (<div role="alert" aria-describedby="{errors}" className={this.cssClasses.error.root}>{errors}</div>);
    }
}
