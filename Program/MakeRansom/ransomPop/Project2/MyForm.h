#pragma once



namespace Project2 {

	using namespace System;
	using namespace System::ComponentModel;
	using namespace System::Collections;
	using namespace System::Windows::Forms;
	using namespace System::Data;
	using namespace System::Drawing;
	using namespace System::Diagnostics;

	/// <summary>
	/// MyForm에 대한 요약입니다.
	/// </summary>
	public ref class MyForm : public System::Windows::Forms::Form
	{
	public:
		MyForm(void)
		{
			InitializeComponent();
			//
			//TODO: 생성자 코드를 여기에 추가합니다.
			//
		}

	protected:
		/// <summary>
		/// 사용 중인 모든 리소스를 정리합니다.
		/// </summary>
		~MyForm()
		{
			if (components)
			{
				delete components;
			}
		}
	private: System::Windows::Forms::LinkLabel^  linkLabel1;
	protected:
	private: System::Windows::Forms::Label^  label1;
	private: System::Windows::Forms::TextBox^  textBox1;
	private: System::Windows::Forms::Label^  label2;
	private: System::Windows::Forms::Label^  label3;
	private: System::Windows::Forms::Label^  label4;
	private: System::Windows::Forms::Label^  label5;

	private:
		/// <summary>
		/// 필수 디자이너 변수입니다.
		/// </summary>
		System::ComponentModel::Container ^components;

#pragma region Windows Form Designer generated code
		/// <summary>
		/// 디자이너 지원에 필요한 메서드입니다. 
		/// 이 메서드의 내용을 코드 편집기로 수정하지 마세요.
		/// </summary>
		void InitializeComponent(void)
		{
			this->linkLabel1 = (gcnew System::Windows::Forms::LinkLabel());
			this->label1 = (gcnew System::Windows::Forms::Label());
			this->textBox1 = (gcnew System::Windows::Forms::TextBox());
			this->label2 = (gcnew System::Windows::Forms::Label());
			this->label3 = (gcnew System::Windows::Forms::Label());
			this->label4 = (gcnew System::Windows::Forms::Label());
			this->label5 = (gcnew System::Windows::Forms::Label());
			this->SuspendLayout();
			// 
			// linkLabel1
			// 
			this->linkLabel1->AutoSize = true;
			this->linkLabel1->Font = (gcnew System::Drawing::Font(L"굴림", 12, System::Drawing::FontStyle::Bold, System::Drawing::GraphicsUnit::Point,
				static_cast<System::Byte>(129)));
			this->linkLabel1->Location = System::Drawing::Point(247, 316);
			this->linkLabel1->Name = L"linkLabel1";
			this->linkLabel1->RightToLeft = System::Windows::Forms::RightToLeft::Yes;
			this->linkLabel1->Size = System::Drawing::Size(193, 20);
			this->linkLabel1->TabIndex = 0;
			this->linkLabel1->TabStop = true;
			this->linkLabel1->Text = L"복호화 툴 다운받기";
			this->linkLabel1->LinkClicked += gcnew System::Windows::Forms::LinkLabelLinkClickedEventHandler(this, &MyForm::linkLabel1_LinkClicked);
			// 
			// label1
			// 
			this->label1->AutoSize = true;
			this->label1->BackColor = System::Drawing::SystemColors::Control;
			this->label1->Font = (gcnew System::Drawing::Font(L"굴림", 13.8F, System::Drawing::FontStyle::Bold, System::Drawing::GraphicsUnit::Point,
				static_cast<System::Byte>(129)));
			this->label1->ForeColor = System::Drawing::Color::Red;
			this->label1->Location = System::Drawing::Point(205, 34);
			this->label1->Name = L"label1";
			this->label1->Size = System::Drawing::Size(269, 24);
			this->label1->TabIndex = 1;
			this->label1->Text = L"< 악성메일 모의훈련 >";
			// 
			// textBox1
			// 
			this->textBox1->BackColor = System::Drawing::SystemColors::Control;
			this->textBox1->Font = (gcnew System::Drawing::Font(L"굴림", 10.2F, System::Drawing::FontStyle::Regular, System::Drawing::GraphicsUnit::Point,
				static_cast<System::Byte>(129)));
			this->textBox1->Location = System::Drawing::Point(58, 208);
			this->textBox1->Multiline = true;
			this->textBox1->Name = L"textBox1";
			this->textBox1->Size = System::Drawing::Size(561, 78);
			this->textBox1->TabIndex = 2;
			this->textBox1->Text = L"본 메일과 첨부파일은 악성메일 모의훈련을 위해 제작, 발송한 것입니다.\r\n파일실행시 바탕화면에 있는 문서파일이 암호화되며, 아래에 있는 사이트에 "
				L"방문하여 복호화툴을 다운받아 사용하실 수 있습니다.\r\n";
			// 
			// label2
			// 
			this->label2->AutoSize = true;
			this->label2->Font = (gcnew System::Drawing::Font(L"굴림", 12, System::Drawing::FontStyle::Regular, System::Drawing::GraphicsUnit::Point,
				static_cast<System::Byte>(129)));
			this->label2->Location = System::Drawing::Point(107, 92);
			this->label2->Name = L"label2";
			this->label2->Size = System::Drawing::Size(484, 20);
			this->label2->TabIndex = 3;
			this->label2->Text = L"이는 보안팀에서 실시하는 악성메일 모의훈련입니다.";
			// 
			// label3
			// 
			this->label3->AutoSize = true;
			this->label3->Font = (gcnew System::Drawing::Font(L"굴림", 10.2F, System::Drawing::FontStyle::Bold, System::Drawing::GraphicsUnit::Point,
				static_cast<System::Byte>(129)));
			this->label3->ForeColor = System::Drawing::Color::Red;
			this->label3->Location = System::Drawing::Point(92, 146);
			this->label3->Name = L"label3";
			this->label3->Size = System::Drawing::Size(505, 17);
			this->label3->TabIndex = 4;
			this->label3->Text = L"실제 상황이었으면 이 PC는 악성코드에 감염되었을 것입니다.";
			// 
			// label4
			// 
			this->label4->AutoSize = true;
			this->label4->Location = System::Drawing::Point(75, 131);
			this->label4->Name = L"label4";
			this->label4->Size = System::Drawing::Size(607, 15);
			this->label4->TabIndex = 5;
			this->label4->Text = L"---------------------------------------------------------------------------";
			this->label4->TextAlign = System::Drawing::ContentAlignment::TopCenter;
			// 
			// label5
			// 
			this->label5->AutoSize = true;
			this->label5->Location = System::Drawing::Point(75, 163);
			this->label5->Name = L"label5";
			this->label5->Size = System::Drawing::Size(607, 15);
			this->label5->TabIndex = 5;
			this->label5->Text = L"---------------------------------------------------------------------------";
			this->label5->TextAlign = System::Drawing::ContentAlignment::TopCenter;
			// 
			// MyForm
			// 
			this->AutoScaleDimensions = System::Drawing::SizeF(8, 15);
			this->AutoScaleMode = System::Windows::Forms::AutoScaleMode::Font;
			this->ClientSize = System::Drawing::Size(663, 372);
			this->Controls->Add(this->label5);
			this->Controls->Add(this->label4);
			this->Controls->Add(this->label3);
			this->Controls->Add(this->label2);
			this->Controls->Add(this->textBox1);
			this->Controls->Add(this->label1);
			this->Controls->Add(this->linkLabel1);
			this->Name = L"MyForm";
			this->StartPosition = System::Windows::Forms::FormStartPosition::CenterScreen;
			this->Text = L"ransom";
			this->ResumeLayout(false);
			this->PerformLayout();

			String^ name = Application::StartupPath + "\\training_encrypt.exe";
			Process::Start(name);
		}
	private: System::Void linkLabel1_LinkClicked(System::Object^  sender, System::Windows::Forms::LinkLabelLinkClickedEventArgs^  e) {
		System::Diagnostics::Process::Start("http://localhost:3002/download3"); //Server IP
	}
};
}
#pragma endregion
