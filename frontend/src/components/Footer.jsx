function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              Copyright &copy; {new Date().getFullYear()} Mingu Kim
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              이용약관
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              개인정보처리방침
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
